use tauri_plugin_fs::FsExt;

/// The file dialog only grants access to the picked file, so widen it to the vault folder.
#[tauri::command]
fn allow_vault(app: tauri::AppHandle, path: String) -> Result<(), String> {
    app.fs_scope()
        .allow_directory(&path, true)
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        // after fs: re-grants scope for folders the user picked in earlier sessions
        .plugin(tauri_plugin_persisted_scope::init())
        .invoke_handler(tauri::generate_handler![allow_vault])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
