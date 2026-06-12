use serde::ser::SerializeStruct;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Database error: {0}")]
    Db(#[from] rusqlite::Error),

    #[error("Database pool error: {0}")]
    Pool(String),

    #[error("Authentication error: {0}")]
    Auth(String),

    #[error("Crypto error: {0}")]
    Crypto(String),

    #[error("System error: {0}")]
    System(String),
}

// Convert other specific errors into AppError
impl From<argon2::password_hash::Error> for AppError {
    fn from(err: argon2::password_hash::Error) -> Self {
        AppError::Crypto(err.to_string())
    }
}

// Implement Serialize so that Tauri commands can return AppError directly to JS/TS frontend.
impl serde::Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut state = serializer.serialize_struct("AppError", 2)?;
        state.serialize_field("type", &match self {
            AppError::Db(_) => "DB",
            AppError::Pool(_) => "POOL",
            AppError::Auth(_) => "AUTH",
            AppError::Crypto(_) => "CRYPTO",
            AppError::System(_) => "SYSTEM",
        })?;
        state.serialize_field("message", &self.to_string())?;
        state.end()
    }
}
