use crate::errors::AppError;
use aes_gcm::{aead::{Aead, KeyInit}, Aes256Gcm, Nonce};
use argon2::{Argon2, password_hash::SaltString};

// Hashes a PIN/passcode/pattern using Argon2id with a random salt for verification storage
#[allow(dead_code)]
pub fn hash_credential(plain: &str) -> Result<String, AppError> {
    use argon2::password_hash::{rand_core::OsRng, PasswordHasher};
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let hashed = argon2
        .hash_password(plain.as_bytes(), &salt)
        .map_err(|e| AppError::Crypto(e.to_string()))?
        .to_string();
    Ok(hashed)
}

// Verifies a plain PIN/passcode/pattern against an Argon2id hash
#[allow(dead_code)]
pub fn verify_credential(plain: &str, hashed_hash: &str) -> Result<bool, AppError> {
    use argon2::password_hash::PasswordHash;
    use argon2::password_hash::PasswordVerifier;
    let parsed_hash = PasswordHash::new(hashed_hash)
        .map_err(|e| AppError::Crypto(e.to_string()))?;
    
    let argon2 = Argon2::default();
    let is_valid = argon2.verify_password(plain.as_bytes(), &parsed_hash).is_ok();
    Ok(is_valid)
}

// Derives a 32-byte key deterministically from the PIN
pub fn derive_key(pin: &str) -> Result<[u8; 32], AppError> {
    // Fixed salt for key derivation
    let salt = SaltString::from_b64("c2FsdF9mb3JfZGIxMg") // minimum salt length
        .map_err(|e| AppError::Crypto(e.to_string()))?;
    let mut key = [0u8; 32];
    Argon2::default()
        .hash_password_into(pin.as_bytes(), salt.as_str().as_bytes(), &mut key)
        .map_err(|e| AppError::Crypto(e.to_string()))?;
    Ok(key)
}

// Encrypts plain text using AES-256-GCM
pub fn encrypt_data(plain_text: &str, key_bytes: &[u8; 32]) -> Result<String, AppError> {
    let cipher = Aes256Gcm::new_from_slice(key_bytes)
        .map_err(|e| AppError::Crypto(e.to_string()))?;
        
    let mut nonce_bytes = [0u8; 12];
    rand_core::RngCore::fill_bytes(&mut rand_core::OsRng, &mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);
    
    let ciphertext = cipher.encrypt(nonce, plain_text.as_bytes())
        .map_err(|e| AppError::Crypto(e.to_string()))?;
        
    let mut combined = nonce_bytes.to_vec();
    combined.extend_from_slice(&ciphertext);
    Ok(hex::encode(combined))
}

// Decrypts cipher text using AES-256-GCM
pub fn decrypt_data(hex_str: &str, key_bytes: &[u8; 32]) -> Result<String, AppError> {
    let combined = hex::decode(hex_str)
        .map_err(|e| AppError::Crypto(format!("Invalid hex string: {}", e)))?;
        
    if combined.len() < 12 {
        return Err(AppError::Crypto("Ciphertext too short".to_string()));
    }
    
    let (nonce_bytes, ciphertext) = combined.split_at(12);
    let nonce = Nonce::from_slice(nonce_bytes);
    
    let cipher = Aes256Gcm::new_from_slice(key_bytes)
        .map_err(|e| AppError::Crypto(e.to_string()))?;
        
    let decrypted = cipher.decrypt(nonce, ciphertext)
        .map_err(|_e| AppError::Auth("Incorrect PIN or database decryption failed".to_string()))?;
        
    String::from_utf8(decrypted)
        .map_err(|e| AppError::Crypto(format!("Invalid UTF-8 in decrypted data: {}", e)))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_credential_hash_and_verify() {
        let pin = "123456";
        let hashed = hash_credential(pin).expect("Failed to hash credential");
        assert!(verify_credential(pin, &hashed).expect("Failed to verify credential"));
        assert!(!verify_credential("wrongpin", &hashed).expect("Failed to verify wrong credential"));
    }

    #[test]
    fn test_key_derivation() {
        let pin1 = "123456";
        let pin2 = "654321";
        
        let key1 = derive_key(pin1).expect("Failed to derive key1");
        let key1_again = derive_key(pin1).expect("Failed to derive key1 again");
        let key2 = derive_key(pin2).expect("Failed to derive key2");
        
        assert_eq!(key1, key1_again);
        assert_ne!(key1, key2);
        assert_eq!(key1.len(), 32);
    }

    #[test]
    fn test_encryption_decryption_roundtrip() {
        let key = derive_key("my-secret-pin").expect("Failed to derive key");
        let original_data = "Hello, zero-based budgeting!";
        
        let encrypted = encrypt_data(original_data, &key).expect("Failed to encrypt");
        let decrypted = decrypt_data(&encrypted, &key).expect("Failed to decrypt");
        
        assert_eq!(original_data, decrypted);
        
        // Test failure with incorrect key
        let wrong_key = derive_key("wrong-pin").expect("Failed to derive wrong key");
        let decrypt_fail = decrypt_data(&encrypted, &wrong_key);
        assert!(decrypt_fail.is_err());
    }

    #[test]
    fn test_decryption_failures() {
        let key = derive_key("pin").expect("Failed to derive key");
        
        // Invalid hex string
        let decrypt_invalid_hex = decrypt_data("not-hex-at-all", &key);
        assert!(decrypt_invalid_hex.is_err());
        
        // Payload too short (less than 12 bytes nonce)
        let too_short_hex = hex::encode(vec![0u8; 10]);
        let decrypt_too_short = decrypt_data(&too_short_hex, &key);
        assert!(decrypt_too_short.is_err());
    }
}
