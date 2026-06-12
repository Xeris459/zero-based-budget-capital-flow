use crate::errors::AppError;

#[cfg(target_os = "windows")]
pub async fn is_biometric_available() -> Result<bool, AppError> {
    use windows::Security::Credentials::UI::{UserConsentVerifier, UserConsentVerifierAvailability};

    let op = UserConsentVerifier::CheckAvailabilityAsync()
        .map_err(|e| AppError::System(format!("Failed to check availability: {}", e)))?;
        
    let availability = op.get()
        .map_err(|e| AppError::System(format!("Async check failed: {}", e)))?;

    Ok(availability == UserConsentVerifierAvailability::Available)
}

#[cfg(target_os = "windows")]
pub async fn authenticate_with_biometrics(reason: &str) -> Result<bool, AppError> {
    use windows::Security::Credentials::UI::{UserConsentVerifier, UserConsentVerificationResult};
    use windows::core::HSTRING;

    let message = HSTRING::from(reason);
    let op = UserConsentVerifier::RequestVerificationAsync(&message)
        .map_err(|e| AppError::System(format!("Failed to request verification: {}", e)))?;
        
    let result = op.get()
        .map_err(|e| AppError::System(format!("Async verification failed: {}", e)))?;

    Ok(result == UserConsentVerificationResult::Verified)
}

// Fallback logic for non-Windows platforms to prevent compilation errors
#[cfg(not(target_os = "windows"))]
pub async fn is_biometric_available() -> Result<bool, AppError> {
    Ok(false)
}

#[cfg(not(target_os = "windows"))]
pub async fn authenticate_with_biometrics(_reason: &str) -> Result<bool, AppError> {
    Err(AppError::System("Biometric authentication is not supported on this platform.".to_string()))
}
