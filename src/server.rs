use futures::{FutureExt, StreamExt};
use serde::*;
use serde_json::from_str;
use warp::Filter;

#[derive(Clone, Deserialize, Debug)]
#[serde(tag = "method", content = "params")]
#[serde(rename_all(deserialize = "kebab-case"))]
enum IncommingRPC {
    Attack { sound: String },
    Release { sound: String },
    SetEffect { value: f32 },
    UnsetEffect,
}

#[tokio::main]
async fn main() {
    pretty_env_logger::init();

    let app_ws = warp::path("ws").and(warp::ws()).map(|ws: warp::ws::Ws| {
        ws.on_upgrade(|websocket| async {
            let (tx, mut rx) = websocket.split();
            while let Some(msg) = rx.next().await.and_then(|mb_msg| mb_msg.ok())
            {
                if let Ok(text) = msg.to_str() {
                    if let Ok(rpc) = from_str::<IncommingRPC>(text) {
                        println!("{:?}", rpc);
                    }
                }
            }
        })
    });

    let app_get = warp::fs::dir("website");

    let routes = app_get;

    warp::serve(app_ws.or(routes))
        .run(([127, 0, 0, 1], 3030))
        .await;
}
