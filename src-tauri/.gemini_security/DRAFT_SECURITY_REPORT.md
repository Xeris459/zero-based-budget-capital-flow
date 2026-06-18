# Security Audit Report

### Newly Introduced Vulnerabilities

**ID:** VULN-001
*   **Vulnerability:** Hardcoded Salt for Key Derivation
*   **Vulnerability Type:** Security
*   **Severity:** Medium
*   **Source Location:** `src/auth/crypto.rs:33`
*   **Sink Location:** N/A
*   **Data Type:** N/A
*   **Line Content:** `let salt = SaltString::from_b64("c2FsdF9mb3JfZGIxMg")`
*   **Description:** Aplikasi menggunakan *fixed salt* dalam fungsi Argon2 untuk menurunkan kunci enkripsi dari PIN. Meskipun sistem ini bersifat lokal, penggunaan salt statis membuat proses derivasi kunci rentan terhadap serangan kamus pra-komputasi (*rainbow table*) apabila *attacker* berhasil menyalin file database.
*   **Recommendation:** Ubah logika registrasi awal (`register_pin`) untuk men-generate *random salt* yang unik per instalasi. Simpan salt ini dalam bentuk *plaintext* di file terpisah (misalnya `config.json` di app_data_dir) atau simpan di OS Keyring bersama dengan PIN, lalu baca salt tersebut setiap kali melakukan `derive_key`.

**ID:** VULN-002
*   **Vulnerability:** Vulnerable Transitive Dependency (glib)
*   **Vulnerability Type:** Security
*   **Severity:** Medium
*   **Source Location:** `Cargo.lock:glib`
*   **Sink Location:** N/A
*   **Data Type:** N/A
*   **Line Content:** `glib@0.18.5`
*   **Description:** Kerentanan RUSTSEC-2024-0429 dideteksi pada crate `glib` (transitive dependency dari `gtk`/`tauri`). Terdapat kelemahan (*unsoundness*) pada implementasi `Iterator` yang dapat memicu memori yang tidak aman (*memory unsafety*).
*   **Recommendation:** Jalankan `cargo update -p glib` untuk memaksa pembaruan ke versi patch yang aman (>=0.20.0).
