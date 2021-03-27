use crate::IncommingRPC;
use rodio::{Sample, Source};
use std::{
    fs::File,
    io::BufReader,
    sync::{Arc, RwLock},
    time::Duration,
};
use tokio::sync::mpsc::Receiver;

pub const SAMPLE_RATE: u32 = 44_100;
pub const ONE_OVER_RATE: f32 = 1.0 / SAMPLE_RATE as f32;
pub const BASE_VOLUME: f32 = 0.05;

pub fn play_sounds(mut rx: Receiver<IncommingRPC>) {
    let (stream, stream_handle) = rodio::OutputStream::try_default().unwrap();
    let (mixer_controller, mixer) = rodio::dynamic_mixer::mixer(1, SAMPLE_RATE);

    let file1 = std::fs::read("assets/4OP-FM_kick.mp3").unwrap();
    let file2 = std::fs::read("assets/4OP-FM_snare.mp3").unwrap();
    let mut state = Arc::new(RwLock::new(vec![false; 16]));

    for i in 0..8 {
        let state = state.clone();
        let dec = rodio::Decoder::new(std::io::Cursor::new(file1.clone()))
            .unwrap()
            .repeat_infinite()
            .pausable(true)
            .periodic_access(Duration::from_millis(1), move |src| {
                let state = state.read().unwrap();
                src.set_paused(!state[i]);
            });
        mixer_controller.add(dec);
    }

    for i in 8..16 {
        let state = state.clone();
        let dec = rodio::Decoder::new(std::io::Cursor::new(file2.clone()))
            .unwrap()
            .repeat_infinite()
            .pausable(true)
            .periodic_access(Duration::from_millis(1), move |src| {
                let state = state.read().unwrap();
                src.set_paused(!state[i]);
            });
        mixer_controller.add(dec);
    }

    let sink = rodio::Sink::try_new(&stream_handle).unwrap();
    sink.set_volume(BASE_VOLUME);
    sink.append(mixer);

    let mut dot = false;
    let mut value = 0.0;

    while let Some(rpc) = rx.blocking_recv() {
        use IncommingRPC::*;

        match rpc {
            Key { number, down } => {
                let mut state = state.write().unwrap();
                state[number as usize] = down;
            }
            Line { value: new_value } => {
                value = new_value.max(0.0).min(1.0);

                if dot {
                    sink.set_volume(BASE_VOLUME + value * 0.1);
                }
            }
            Dot { down } =>
                if down {
                    sink.set_volume(BASE_VOLUME + value * 0.1);
                } else {
                    sink.set_volume(BASE_VOLUME);
                },
            _ => {}
        }
    }
}
