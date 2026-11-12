use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedSet, Vector};
use near_sdk::json_types::U64;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, near_bindgen, require, AccountId, PanicOnDefault};

/// Standard event format for indexers
#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct ScorecardPublishedEvent {
    pub delegate_account: AccountId,
    pub evaluation_period: String,
    pub score: u8,
    pub grade: String,
    pub evidence_hash: String,
    pub methodology_version: String,
    pub publisher: AccountId,
    pub timestamp_ns: U64,
    pub is_correction: bool,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(crate = "near_sdk::serde")]
pub struct Scorecard {
    pub delegate_account: AccountId,
    pub evaluation_period: String,
    pub score: u8,
    pub grade: String,
    pub evidence_hash: String,
    pub scoring_methodology_version: String,
    pub publication_timestamp: u64,
    pub publisher_account: AccountId,
    pub is_correction: bool,
    pub previous_evidence_hash: Option<String>,
    pub correction_reason: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct RegistryStats {
    pub total_scorecards_published: u64,
    pub total_delegates_tracked: u64,
    pub authorized_publishers_count: u64,
    pub methodology_version: String,
    pub owner: AccountId,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct VerificationResult {
    pub is_verified: bool,
    pub matches_evidence_hash: bool,
    pub published_score: Option<u8>,
    pub published_grade: Option<String>,
    pub publication_timestamp: Option<u64>,
    pub publisher: Option<AccountId>,
    pub is_correction: Option<bool>,
    pub message: String,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct TurnoutScorecardRegistry {
    pub owner: AccountId,
    pub authorized_publishers: UnorderedSet<AccountId>,
    /// Maps (delegate_account, evaluation_period) -> Scorecard
    pub scorecards: LookupMap<String, Scorecard>,
    /// Maps delegate_account -> list of evaluation_periods
    pub delegate_periods: LookupMap<AccountId, Vector<String>>,
    pub all_delegates: UnorderedSet<AccountId>,
    pub total_scorecards_published: u64,
    pub default_methodology_version: String,
}

#[near_bindgen]
impl TurnoutScorecardRegistry {
    #[init]
    pub fn new(owner: AccountId, default_methodology_version: Option<String>) -> Self {
        require!(!env::state_exists(), "Already initialized");
        let mut publishers = UnorderedSet::new(b"p");
        publishers.insert(&owner);

        Self {
            owner: owner.clone(),
            authorized_publishers: publishers,
            scorecards: LookupMap::new(b"s"),
            delegate_periods: LookupMap::new(b"d"),
            all_delegates: UnorderedSet::new(b"a"),
            total_scorecards_published: 0,
            default_methodology_version: default_methodology_version
                .unwrap_or_else(|| "turnout-scoring-v1.0.0".to_string()),
        }
    }

    /// Access control: add an authorized publisher (only owner)
    pub fn add_publisher(&mut self, publisher: AccountId) {
        self.assert_owner();
        self.authorized_publishers.insert(&publisher);
        env::log_str(&format!("EVENT_JSON:{{\"standard\":\"turnout\",\"version\":\"1.0.0\",\"event\":\"publisher_added\",\"account\":\"{}\"}}", publisher));
    }

    /// Access control: remove an authorized publisher (only owner)
    pub fn remove_publisher(&mut self, publisher: AccountId) {
        self.assert_owner();
        require!(publisher != self.owner, "Cannot remove contract owner as publisher");
        self.authorized_publishers.remove(&publisher);
        env::log_str(&format!("EVENT_JSON:{{\"standard\":\"turnout\",\"version\":\"1.0.0\",\"event\":\"publisher_removed\",\"account\":\"{}\"}}", publisher));
    }

    /// Publish or explicitly correct a delegate scorecard
    pub fn publish_scorecard(
        &mut self,
        delegate_account: AccountId,
        evaluation_period: String,
        score: u8,
        grade: String,
        evidence_hash: String,
        methodology_version: Option<String>,
        is_correction: Option<bool>,
        correction_reason: Option<String>,
    ) -> Scorecard {
        self.assert_publisher();

        // 1. Validations
        require!(score <= 100, "Score must be between 0 and 100 inclusive");
        require!(
            evaluation_period.len() >= 3 && evaluation_period.len() <= 64,
            "Evaluation period must be between 3 and 64 characters"
        );
        require!(
            evidence_hash.len() == 64,
            "Evidence hash must be a 64-character SHA-256 hex string"
        );
        require!(
            grade.len() >= 1 && grade.len() <= 2,
            "Grade must be 1 to 2 characters (e.g. A, B, C, D, F)"
        );

        let valid_grades = ["A", "B", "C", "D", "F"];
        require!(
            valid_grades.contains(&grade.as_str()),
            "Grade must be one of: A, B, C, D, F"
        );

        let is_correction = is_correction.unwrap_or(false);
        let key = Self::format_key(&delegate_account, &evaluation_period);
        let existing = self.scorecards.get(&key);

        let mut prev_evidence_hash = None;

        if let Some(existing_record) = existing {
            require!(
                is_correction,
                "Scorecard for this period already exists. Explicit correction flag required to overwrite"
            );
            require!(
                correction_reason.is_some() && !correction_reason.as_ref().unwrap().trim().is_empty(),
                "Correction reason is required when correcting an existing scorecard"
            );
            prev_evidence_hash = Some(existing_record.evidence_hash);
        }

        let meth_version = methodology_version
            .unwrap_or_else(|| self.default_methodology_version.clone());
        require!(
            meth_version.len() <= 32,
            "Methodology version must be <= 32 characters"
        );

        let timestamp_ns = env::block_timestamp();

        let scorecard = Scorecard {
            delegate_account: delegate_account.clone(),
            evaluation_period: evaluation_period.clone(),
            score,
            grade: grade.clone(),
            evidence_hash: evidence_hash.clone(),
            scoring_methodology_version: meth_version.clone(),
            publication_timestamp: timestamp_ns,
            publisher_account: env::predecessor_account_id(),
            is_correction,
            previous_evidence_hash: prev_evidence_hash,
            correction_reason,
        };

        // Persist scorecard
        self.scorecards.insert(&key, &scorecard);

        // Record period history if new
        let mut periods = self
            .delegate_periods
            .get(&delegate_account)
            .unwrap_or_else(|| {
                let vec_key = format!("v_{}", delegate_account);
                Vector::new(vec_key.as_bytes())
            });

        let mut period_exists = false;
        for i in 0..periods.len() {
            if periods.get(i).unwrap() == evaluation_period {
                period_exists = true;
                break;
            }
        }
        if !period_exists {
            periods.push(&evaluation_period);
            self.delegate_periods.insert(&delegate_account, &periods);
        }

        self.all_delegates.insert(&delegate_account);
        self.total_scorecards_published += 1;

        // Emit standard NEP-like event
        let event = ScorecardPublishedEvent {
            delegate_account: delegate_account.clone(),
            evaluation_period: evaluation_period.clone(),
            score,
            grade,
            evidence_hash,
            methodology_version: meth_version,
            publisher: env::predecessor_account_id(),
            timestamp_ns: U64(timestamp_ns),
            is_correction,
        };
        let event_json = serde_json::to_string(&event).unwrap();
        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"turnout\",\"version\":\"1.0.0\",\"event\":\"scorecard_published\",\"data\":{}}}",
            event_json
        ));

        scorecard
    }

    /// Read an individual scorecard by delegate account and period
    pub fn get_scorecard(
        &self,
        delegate_account: AccountId,
        evaluation_period: String,
    ) -> Option<Scorecard> {
        let key = Self::format_key(&delegate_account, &evaluation_period);
        self.scorecards.get(&key)
    }

    /// Get all recorded evaluation periods and scorecards for a delegate
    pub fn get_delegate_history(&self, delegate_account: AccountId) -> Vec<Scorecard> {
        let periods = self.delegate_periods.get(&delegate_account);
        let mut history = Vec::new();
        if let Some(periods) = periods {
            for i in 0..periods.len() {
                let period = periods.get(i).unwrap();
                let key = Self::format_key(&delegate_account, &period);
                if let Some(sc) = self.scorecards.get(&key) {
                    history.push(sc);
                }
            }
        }
        history
    }

    /// Verify an off-chain calculated scorecard against the on-chain registry
    pub fn verify_scorecard(
        &self,
        delegate_account: AccountId,
        evaluation_period: String,
        claimed_evidence_hash: String,
    ) -> VerificationResult {
        let key = Self::format_key(&delegate_account, &evaluation_period);
        match self.scorecards.get(&key) {
            None => VerificationResult {
                is_verified: false,
                matches_evidence_hash: false,
                published_score: None,
                published_grade: None,
                publication_timestamp: None,
                publisher: None,
                is_correction: None,
                message: format!(
                    "No scorecard registered for delegate '{}' in period '{}'",
                    delegate_account, evaluation_period
                ),
            },
            Some(sc) => {
                let matches = sc.evidence_hash.to_lowercase() == claimed_evidence_hash.to_lowercase();
                VerificationResult {
                    is_verified: matches,
                    matches_evidence_hash: matches,
                    published_score: Some(sc.score),
                    published_grade: Some(sc.grade),
                    publication_timestamp: Some(sc.publication_timestamp),
                    publisher: Some(sc.publisher_account),
                    is_correction: Some(sc.is_correction),
                    message: if matches {
                        "Evidence hash successfully verified against on-chain registry".to_string()
                    } else {
                        format!(
                            "Hash mismatch: registered hash is '{}', provided hash was '{}'",
                            sc.evidence_hash, claimed_evidence_hash
                        )
                    },
                }
            }
        }
    }

    /// Get registry global statistics
    pub fn get_registry_stats(&self) -> RegistryStats {
        RegistryStats {
            total_scorecards_published: self.total_scorecards_published,
            total_delegates_tracked: self.all_delegates.len(),
            authorized_publishers_count: self.authorized_publishers.len(),
            methodology_version: self.default_methodology_version.clone(),
            owner: self.owner.clone(),
        }
    }

    /// Check if an account is an authorized publisher
    pub fn is_publisher(&self, account_id: AccountId) -> bool {
        self.authorized_publishers.contains(&account_id)
    }

    // Helper functions
    fn format_key(delegate: &AccountId, period: &str) -> String {
        format!("{}:{}", delegate, period)
    }

    fn assert_owner(&self) {
        require!(
            env::predecessor_account_id() == self.owner,
            "Only contract owner can execute this call"
        );
    }

    fn assert_publisher(&self) {
        let caller = env::predecessor_account_id();
        require!(
            self.authorized_publishers.contains(&caller),
            "Caller is not an authorized scorecard publisher"
        );
    }
}

// Unit tests
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::VMContextBuilder;
    use near_sdk::testing_env;

    fn get_context(predecessor: AccountId) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder.predecessor_account_id(predecessor);
        builder.block_timestamp(1700000000000000000);
        builder
    }

    #[test]
    fn test_initialization() {
        let owner: AccountId = "owner.near".parse().unwrap();
        let context = get_context(owner.clone());
        testing_env!(context.build());

        let contract = TurnoutScorecardRegistry::new(owner.clone(), None);
        let stats = contract.get_registry_stats();
        assert_eq!(stats.total_scorecards_published, 0);
        assert_eq!(stats.total_delegates_tracked, 0);
        assert_eq!(stats.owner, owner);
        assert!(contract.is_publisher(owner));
    }

    #[test]
    fn test_publish_and_get_scorecard() {
        let owner: AccountId = "turnout-oracle.testnet".parse().unwrap();
        let delegate: AccountId = "infura.poolv1.near".parse().unwrap();
        let context = get_context(owner.clone());
        testing_env!(context.build());

        let mut contract = TurnoutScorecardRegistry::new(owner.clone(), None);

        let hash = "a".repeat(64);
        let sc = contract.publish_scorecard(
            delegate.clone(),
            "HOS-2026-Q1".to_string(),
            94,
            "A".to_string(),
            hash.clone(),
            Some("v1.0.0".to_string()),
            None,
            None,
        );

        assert_eq!(sc.score, 94);
        assert_eq!(sc.grade, "A");
        assert_eq!(sc.delegate_account, delegate);

        let retrieved = contract.get_scorecard(delegate.clone(), "HOS-2026-Q1".to_string());
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().evidence_hash, hash);

        let history = contract.get_delegate_history(delegate.clone());
        assert_eq!(history.len(), 1);

        let stats = contract.get_registry_stats();
        assert_eq!(stats.total_scorecards_published, 1);
        assert_eq!(stats.total_delegates_tracked, 1);
    }

    #[test]
    fn test_verify_scorecard() {
        let owner: AccountId = "turnout.testnet".parse().unwrap();
        let delegate: AccountId = "crypto-delegate.near".parse().unwrap();
        let context = get_context(owner.clone());
        testing_env!(context.build());

        let mut contract = TurnoutScorecardRegistry::new(owner.clone(), None);
        let true_hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855".to_string();

        contract.publish_scorecard(
            delegate.clone(),
            "2026-M11".to_string(),
            88,
            "B".to_string(),
            true_hash.clone(),
            None,
            None,
            None,
        );

        // Verification with exact hash
        let result = contract.verify_scorecard(delegate.clone(), "2026-M11".to_string(), true_hash.clone());
        assert!(result.is_verified);
        assert!(result.matches_evidence_hash);
        assert_eq!(result.published_score, Some(88));

        // Verification with forged hash
        let fake_hash = "0".repeat(64);
        let fake_result = contract.verify_scorecard(delegate.clone(), "2026-M11".to_string(), fake_hash);
        assert!(!fake_result.is_verified);
        assert!(!fake_result.matches_evidence_hash);
    }

    #[test]
    #[should_panic(expected = "Scorecard for this period already exists")]
    fn test_prevent_silent_overwrite() {
        let owner: AccountId = "turnout.testnet".parse().unwrap();
        let delegate: AccountId = "delegate.near".parse().unwrap();
        let context = get_context(owner.clone());
        testing_env!(context.build());

        let mut contract = TurnoutScorecardRegistry::new(owner.clone(), None);
        let hash = "b".repeat(64);

        contract.publish_scorecard(
            delegate.clone(),
            "2026-Q1".to_string(),
            90,
            "A".to_string(),
            hash.clone(),
            None,
            None,
            None,
        );

        // Second publish without is_correction must panic
        contract.publish_scorecard(
            delegate.clone(),
            "2026-Q1".to_string(),
            85,
            "B".to_string(),
            hash.clone(),
            None,
            Some(false),
            None,
        );
    }

    #[test]
    fn test_explicit_correction() {
        let owner: AccountId = "turnout.testnet".parse().unwrap();
        let delegate: AccountId = "delegate.near".parse().unwrap();
        let context = get_context(owner.clone());
        testing_env!(context.build());

        let mut contract = TurnoutScorecardRegistry::new(owner.clone(), None);
        let hash1 = "1".repeat(64);
        let hash2 = "2".repeat(64);

        contract.publish_scorecard(
            delegate.clone(),
            "2026-Q1".to_string(),
            75,
            "C".to_string(),
            hash1.clone(),
            None,
            None,
            None,
        );

        let corrected = contract.publish_scorecard(
            delegate.clone(),
            "2026-Q1".to_string(),
            85,
            "B".to_string(),
            hash2.clone(),
            None,
            Some(true),
            Some("Late forum explanation verified after dispute".to_string()),
        );

        assert_eq!(corrected.score, 85);
        assert_eq!(corrected.grade, "B");
        assert!(corrected.is_correction);
        assert_eq!(corrected.previous_evidence_hash, Some(hash1));
        assert_eq!(
            corrected.correction_reason,
            Some("Late forum explanation verified after dispute".to_string())
        );
    }

    #[test]
    #[should_panic(expected = "Caller is not an authorized scorecard publisher")]
    fn test_unauthorized_publisher_rejected() {
        let owner: AccountId = "owner.near".parse().unwrap();
        let hacker: AccountId = "hacker.near".parse().unwrap();
        let delegate: AccountId = "delegate.near".parse().unwrap();

        let context = get_context(owner.clone());
        testing_env!(context.build());
        let mut contract = TurnoutScorecardRegistry::new(owner.clone(), None);

        // Switch caller to hacker
        let context2 = get_context(hacker);
        testing_env!(context2.build());

        contract.publish_scorecard(
            delegate,
            "2026-Q1".to_string(),
            100,
            "A".to_string(),
            "c".repeat(64),
            None,
            None,
            None,
        );
    }
}

