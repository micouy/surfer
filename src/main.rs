#![feature(box_syntax)]

use futures::{FutureExt, StreamExt};
use serde::*;
use serde_json::from_str;
use tokio::sync::mpsc::{channel, Sender};
use warp::Filter;

mod sound;

use sound::*;


#[derive(Clone, Deserialize, Debug)]
#[serde(tag = "method", content = "params")]
#[serde(rename_all(deserialize = "kebab-case"))]
pub enum IncommingRPC {
    Attack { sound: String },
    Release { sound: String },
    SetEffect { value: f32 },
    UnsetEffect {},
}

#[tokio::main]
async fn main() {
    pretty_env_logger::init();
    let (sound_tx, sound_rx) = channel(1);

    let music = tokio::task::spawn_blocking(|| play_sounds(sound_rx));

    let state = warp::any().map(move || sound_tx.clone());
    let app_ws = warp::path("ws").and(warp::ws()).and(state).map(
        |ws: warp::ws::Ws, sound_tx: Sender<_>| {
            ws.on_upgrade(move |websocket: warp::ws::WebSocket| async move {
                let (tx, mut rx) = websocket.split();

                while let Some(Ok(msg)) = rx.next().await {
                    if let Ok(text) = msg.to_str() {
                        if let Ok(rpc) = from_str::<IncommingRPC>(text) {
                            println!("{:?}", rpc);
                            sound_tx.send(rpc).await;
                        }
                    }
                }
            })
        },
    );
    let app_get = warp::fs::dir("website");
    let routes = app_get;

    warp::serve(app_ws.or(routes))
        .run(([127, 0, 0, 1], 3030))
        .await;
}
