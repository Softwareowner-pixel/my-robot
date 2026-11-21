#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{
    menu::{Menu, MenuItem},
    tray::{TrayIconBuilder, TrayIconEvent},
    Manager, Runtime,
};
use tauri_plugin_global_shortcut::{Code, Modifiers, ShortcutState};
use std::sync::{Arc, Mutex};

// App state
struct AppState {
    is_listening: Arc<Mutex<bool>>,
    hotkey: Arc<Mutex<String>>,
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            let handle = app.handle();
            let state = AppState {
                is_listening: Arc::new(Mutex::new(false)),
                hotkey: Arc::new(Mutex::new("`".to_string())),
            };

            // Register global shortcuts
            let global_shortcut = handle.global_shortcut();

            // Primary: backtick
            global_shortcut.on_shortcut("`", move |_app, _shortcut, event| {
                if event.state == ShortcutState::Pressed {
                    let _ = _app.emit("hotkey-pressed", ());
                } else if event.state == ShortcutState::Released {
                    let _ = _app.emit("hotkey-released", ());
                }
            })?;

            // Alt: Ctrl+Space
            global_shortcut.on_shortcut("Ctrl+Space", move |_app, _shortcut, event| {
                if event.state == ShortcutState::Pressed {
                    let _ = _app.emit("hotkey-pressed", ());
                } else if event.state == ShortcutState::Released {
                    let _ = _app.emit("hotkey-released", ());
                }
            })?;

            // Alt: Ctrl+`
            global_shortcut.on_shortcut("Ctrl+`", move |_app, _shortcut, event| {
                if event.state == ShortcutState::Pressed {
                    let _ = _app.emit("hotkey-pressed", ());
                } else if event.state == ShortcutState::Released {
                    let _ = _app.emit("hotkey-released", ());
                }
            })?;

            // Alt: Insert
            global_shortcut.on_shortcut("Insert", move |_app, _shortcut, event| {
                if event.state == ShortcutState::Pressed {
                    let _ = _app.emit("hotkey-pressed", ());
                } else if event.state == ShortcutState::Released {
                    let _ = _app.emit("hotkey-released", ());
                }
            })?;

            // System tray
            let show_item = MenuItem::with_id(handle, "show", "Show my robot", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(handle, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(handle, &[&show_item, &quit_item])?;

            TrayIconBuilder::new()
                .icon(handle.default_window_icon().cloned().unwrap())
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { .. } = event {
                        if let Some(window) = tray.app_handle().get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(handle)?;

            // Hide window on close instead of quitting
            if let Some(window) = handle.get_webview_window("main") {
                let handle_clone = handle.clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        let _ = window.hide();
                    }
                });
            }

            app.manage(state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            get_system_info,
            open_app,
            play_music,
            web_search,
            file_operations,
            send_quick_message,
            transcribe_audio,
            synthesize_speech,
            chat_complete,
            get_memory_facts,
            add_memory_fact,
            delete_memory_fact,
            get_skill_permissions,
            toggle_skill_permission,
            get_character,
            update_character,
            get_daily_briefing,
            generate_daily_briefing,
            dismiss_briefing,
            get_cloud_usage,
            get_pc_licenses,
            authorize_pc,
            deauthorize_pc,
            pair_remote,
            end_remote_session,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Basic commands
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to my robot.", name)
}

#[tauri::command]
fn get_system_info() -> serde_json::Value {
    serde_json::json!({
        "os": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "version": env!("CARGO_PKG_VERSION"),
    })
}

// PC Action commands
#[tauri::command]
async fn open_app(app_name: String) -> Result<serde_json::Value, String> {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        let apps = [
            ("spotify", "spotify"),
            ("steam", "steam"),
            ("chrome", "chrome"),
            ("notepad", "notepad"),
            ("calculator", "calc"),
            ("settings", "ms-settings:"),
            ("explorer", "explorer"),
            ("cmd", "cmd"),
            ("powershell", "powershell"),
            ("vscode", "code"),
        ];

        let cmd = apps.iter()
            .find(|(k, _)| app_name.to_lowercase().contains(k))
            .map(|(_, c)| *c)
            .unwrap_or(&app_name);

        let result = if cmd.starts_with("ms-") || cmd.starts_with("http") {
            Command::new("cmd").args(["/C", "start", "", cmd]).spawn()
        } else {
            Command::new(cmd).spawn()
        };

        match result {
            Ok(child) => Ok(serde_json::json!({ "success": true, "pid": child.id() })),
            Err(e) => Ok(serde_json::json!({ "success": false, "error": e.to_string() })),
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(serde_json::json!({ "success": false, "error": "Windows only" }))
    }
}

#[tauri::command]
async fn play_music(query: String, source: String) -> Result<serde_json::Value, String> {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        let url = match source.as_str() {
            "spotify" => format!("spotify:search:{}", urlencoding::encode(&query)),
            "youtube" => format!("https://www.youtube.com/results?search_query={}", urlencoding::encode(&query)),
            "local" => {
                // Open media player with local files
                let _ = Command::new("cmd").args(["/C", "start", "wmplayer"]).spawn();
                return Ok(serde_json::json!({ "success": true }));
            }
            _ => return Ok(serde_json::json!({ "success": false, "error": "Invalid source" })),
        };

        let result = Command::new("cmd").args(["/C", "start", "", &url]).spawn();
        match result {
            Ok(_) => Ok(serde_json::json!({ "success": true })),
            Err(e) => Ok(serde_json::json!({ "success": false, "error": e.to_string() })),
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(serde_json::json!({ "success": false, "error": "Windows only" }))
    }
}

#[tauri::command]
async fn web_search(query: String) -> Result<serde_json::Value, String> {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        let url = format!("https://www.google.com/search?q={}", urlencoding::encode(&query));
        let result = Command::new("cmd").args(["/C", "start", "", &url]).spawn();
        match result {
            Ok(_) => Ok(serde_json::json!({ "success": true })),
            Err(e) => Ok(serde_json::json!({ "success": false, "error": e.to_string() })),
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(serde_json::json!({ "success": false, "error": "Windows only" }))
    }
}

#[tauri::command]
async fn file_operations(action: String, path: Option<String>, query: Option<String>) -> Result<serde_json::Value, String> {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        match action.as_str() {
            "open" => {
                if let Some(p) = path {
                    let result = Command::new("cmd").args(["/C", "start", "", &p]).spawn();
                    match result {
                        Ok(_) => Ok(serde_json::json!({ "success": true })),
                        Err(e) => Ok(serde_json::json!({ "success": false, "error": e.to_string() })),
                    }
                } else {
                    Ok(serde_json::json!({ "success": false, "error": "Path required" }))
                }
            }
            "find" => {
                if let Some(q) = query {
                    // Use Everything SDK or Windows Search
                    // For now, just open explorer search
                    let url = format!("search-ms:query={}", urlencoding::encode(&q));
                    let result = Command::new("cmd").args(["/C", "start", "", &url]).spawn();
                    match result {
                        Ok(_) => Ok(serde_json::json!({ "success": true, "results": [] })),
                        Err(e) => Ok(serde_json::json!({ "success": false, "error": e.to_string() })),
                    }
                } else {
                    Ok(serde_json::json!({ "success": false, "error": "Query required" }))
                }
            }
            _ => Ok(serde_json::json!({ "success": false, "error": "Invalid action" })),
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(serde_json::json!({ "success": false, "error": "Windows only" }))
    }
}

#[tauri::command]
async fn send_quick_message(contact: String, message: String) -> Result<serde_json::Value, String> {
    // Open WhatsApp Web with pre-filled message
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        let url = format!("https://web.whatsapp.com/send?phone={}&text={}",
            urlencoding::encode(&contact),
            urlencoding::encode(&message));
        let result = Command::new("cmd").args(["/C", "start", "", &url]).spawn();
        match result {
            Ok(_) => Ok(serde_json::json!({ "success": true })),
            Err(e) => Ok(serde_json::json!({ "success": false, "error": e.to_string() })),
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(serde_json::json!({ "success": false, "error": "Windows only" }))
    }
}

// Voice/AI commands (stubs for now - real implementation would use Whisper/piper/etc.)
#[tauri::command]
async fn transcribe_audio(audio_base64: String, language: String) -> Result<serde_json::Value, String> {
    // In real implementation: decode base64, send to STT service (Whisper.cpp local or API)
    Ok(serde_json::json!({
        "text": "This is a simulated transcription",
        "confidence": 0.95
    }))
}

#[tauri::command]
async fn synthesize_speech(text: String, voice_gender: String) -> Result<serde_json::Value, String> {
    // In real implementation: send to TTS service (piper local or API), return base64 audio
    Ok(serde_json::json!({
        "audio_base64": "BASE64_PLACEHOLDER",
        "format": "wav"
    }))
}

#[tauri::command]
async fn chat_complete(
    text: String,
    context: Vec<serde_json::Value>,
    skills: Vec<serde_json::Value>
) -> Result<serde_json::Value, String> {
    // In real implementation: call LLM (local Ollama or cloud API)
    // For now, return a simulated response with potential actions
    let response = format!("I heard: \"{}\". This is a simulated response from my robot.", text);

    // Detect potential actions
    let mut actions = Vec::new();
    let lower = text.to_lowercase();
    if lower.contains("open") || lower.contains("launch") {
        actions.push(serde_json::json!({ "type": "open_app", "app": "notepad" }));
    }
    if lower.contains("play") && lower.contains("music") {
        actions.push(serde_json::json!({ "type": "play_music", "query": "lofi" }));
    }
    if lower.contains("search") || lower.contains("look up") {
        actions.push(serde_json::json!({ "type": "web_search", "query": text }));
    }

    Ok(serde_json::json!({
        "response_text": response,
        "actions": actions,
        "memory_updates": []
    }))
}

// Memory commands
#[tauri::command]
async fn get_memory_facts() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!([
        { "id": "1", "userId": "1", "factKey": "name", "factValue": "Alex", "source": "user", "createdAt": "2024-01-01T00:00:00Z", "updatedAt": "2024-01-01T00:00:00Z" },
        { "id": "2", "userId": "1", "factKey": "interest", "factValue": "Rust programming", "source": "user", "createdAt": "2024-01-02T00:00:00Z", "updatedAt": "2024-01-02T00:00:00Z" },
        { "id": "3", "userId": "1", "factKey": "day_context", "factValue": "Working on my robot clone", "source": "inferred", "createdAt": "2024-01-15T00:00:00Z", "updatedAt": "2024-01-15T00:00:00Z" },
    ]))
}

#[tauri::command]
async fn add_memory_fact(fact_key: String, fact_value: String, source: String) -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "id": uuid::Uuid::new_v4().to_string(),
        "userId": "1",
        "factKey": fact_key,
        "factValue": fact_value,
        "source": source,
        "createdAt": chrono::Utc::now().to_rfc3339(),
        "updatedAt": chrono::Utc::now().to_rfc3339(),
    }))
}

#[tauri::command]
async fn delete_memory_fact(id: String) -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({ "deleted": true }))
}

// Skills commands
#[tauri::command]
async fn get_skill_permissions() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!([
        { "id": "1", "userId": "1", "skill": "open_apps", "enabled": true, "updatedAt": "2024-01-01T00:00:00Z" },
        { "id": "2", "userId": "1", "skill": "play_music", "enabled": true, "updatedAt": "2024-01-01T00:00:00Z" },
        { "id": "3", "userId": "1", "skill": "web_search", "enabled": true, "updatedAt": "2024-01-01T00:00:00Z" },
        { "id": "4", "userId": "1", "skill": "file_ops", "enabled": true, "updatedAt": "2024-01-01T00:00:00Z" },
        { "id": "5", "userId": "1", "skill": "quick_message", "enabled": true, "updatedAt": "2024-01-01T00:00:00Z" },
    ]))
}

#[tauri::command]
async fn toggle_skill_permission(skill: String, enabled: bool) -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "id": "1",
        "userId": "1",
        "skill": skill,
        "enabled": enabled,
        "updatedAt": chrono::Utc::now().to_rfc3339(),
    }))
}

// Character commands
#[tauri::command]
async fn get_character() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "id": "1",
        "userId": "1",
        "persona": "assistant",
        "personaText": null,
        "avatarGender": "female",
        "avatarUrl": null,
        "voiceGender": "female",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z",
    }))
}

#[tauri::command]
async fn update_character(
    persona: Option<String>,
    persona_text: Option<String>,
    avatar_gender: Option<String>,
    avatar_url: Option<String>,
    voice_gender: Option<String>
) -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "id": "1",
        "userId": "1",
        "persona": persona.unwrap_or("assistant".to_string()),
        "personaText": persona_text,
        "avatarGender": avatar_gender.unwrap_or("female".to_string()),
        "avatarUrl": avatar_url,
        "voiceGender": voice_gender.unwrap_or("female".to_string()),
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": chrono::Utc::now().to_rfc3339(),
    }))
}

// Daily briefing commands
#[tauri::command]
async fn get_daily_briefing() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "id": "1",
        "userId": "1",
        "briefingDate": chrono::Utc::now().date_naive().to_string(),
        "pick1": { "title": "Rust 1.78 released", "summary": "New features include...", "url": "https://blog.rust-lang.org", "category": "work" },
        "pick2": { "title": "New AI paper on arXiv", "summary": "Attention mechanisms...", "url": "https://arxiv.org", "category": "follows" },
        "pick3": { "title": "Learn Tauri v2", "summary": "Build desktop apps with Rust", "url": "https://tauri.app", "category": "goals" },
        "dismissedAt": null,
        "createdAt": chrono::Utc::now().to_rfc3339(),
    }))
}

#[tauri::command]
async fn generate_daily_briefing() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({ "generated": true }))
}

#[tauri::command]
async fn dismiss_briefing() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({ "dismissed": true }))
}

// Cloud usage commands
#[tauri::command]
async fn get_cloud_usage() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "id": "1",
        "userId": "1",
        "usageDate": chrono::Utc::now().date_naive().to_string(),
        "tokensUsed": 125000,
        "limitDaily": 500000,
        "limitMonthly": 10000000,
        "plan": "basic",
        "createdAt": chrono::Utc::now().to_rfc3339(),
        "updatedAt": chrono::Utc::now().to_rfc3339(),
    }))
}

// PC License commands
#[tauri::command]
async fn get_pc_licenses() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!([
        { "id": "1", "userId": "1", "deviceId": "device-1", "deviceName": "This PC", "authorizedAt": "2024-01-01T00:00:00Z", "deauthorizedAt": null, "isActive": true },
    ]))
}

#[tauri::command]
async fn authorize_pc(device_name: String) -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "id": uuid::Uuid::new_v4().to_string(),
        "userId": "1",
        "deviceId": "device-new",
        "deviceName": device_name,
        "authorizedAt": chrono::Utc::now().to_rfc3339(),
        "deauthorizedAt": null,
        "isActive": true,
    }))
}

#[tauri::command]
async fn deauthorize_pc(id: String) -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({ "deleted": true }))
}

// Remote commands
#[tauri::command]
async fn pair_remote() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "qr_code": "data:image/png;base64,PLACEHOLDER",
        "expiresAt": chrono::Utc::now().to_rfc3339(),
    }))
}

#[tauri::command]
async fn end_remote_session() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({ "ended": true }))
}