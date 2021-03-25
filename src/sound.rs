use crate::IncommingRPC;
use rodio::Source;
use std::{fs::File, io::BufReader, time::Duration};
use tokio::sync::mpsc::Receiver;

pub const SAMPLE_RATE: u32 = 44_100;
pub const ONE_OVER_RATE: f32 = 1.0 / SAMPLE_RATE as f32;

pub struct Sine {
    pub t: u32,
    pub freq: f32,
    pub lfo: Box<dyn Fn(f32) -> f32 + Send>,
}

impl Iterator for Sine {
    type Item = f32;

    fn next(&mut self) -> Option<Self::Item> {
        let t = self.t as f32;
        self.t += 1;

        let I = self.freq * 0.2;

        // sine with LFO modulation
        let sample = (t * 2.0 * 3.14 * self.freq * ONE_OVER_RATE
            + I * (self.lfo)(t))
        .sin();


        Some(sample)
    }
}

impl Source for Sine {
    fn current_frame_len(&self) -> Option<usize> {
        None
    }

    fn channels(&self) -> u16 {
        1
    }

    fn sample_rate(&self) -> u32 {
        SAMPLE_RATE
    }

    fn total_duration(&self) -> Option<std::time::Duration> {
        None
    }
}

pub struct Sawtooth {
    pub t: u32,
    pub period: f32,
    pub lfo: Box<dyn Fn(f32) -> f32 + Send>,
}

impl Iterator for Sawtooth {
    type Item = f32;

    fn next(&mut self) -> Option<Self::Item> {
        let t = self.t as f32;
        self.t += 1;
        let I = 0.2 / self.period;

        let sample = 1.0
            * (((t * ONE_OVER_RATE + I * (self.lfo)(t)) % self.period)
                / self.period
                * 2.0
                - 1.0);

        Some(sample)
    }
}

impl Source for Sawtooth {
    fn current_frame_len(&self) -> Option<usize> {
        None
    }

    fn channels(&self) -> u16 {
        1
    }

    fn sample_rate(&self) -> u32 {
        SAMPLE_RATE
    }

    fn total_duration(&self) -> Option<std::time::Duration> {
        None
    }
}

pub fn play_sounds(mut rx: Receiver<IncommingRPC>) {
    let (stream, stream_handle) = rodio::OutputStream::try_default().unwrap();

    let low_freq = 0.4;
    let sine = Sine {
        t: 0,
        freq: 440.0,
        lfo: box move |t| (2.0 * 3.14 * low_freq * t * ONE_OVER_RATE).sin(),
    };
    let sawtooth = Sawtooth {
        t: 0,
        period: 1.0 / 440.0,
        lfo: box |t| 0.0,
    };

    let sink = rodio::Sink::try_new(&stream_handle).unwrap();
    sink.set_volume(0.1);
    sink.append(sine);

    while let Some(rpc) = rx.blocking_recv() {
        use IncommingRPC::*;

        match rpc {
            SetEffect { value } => {
                let value = value.max(0.0).min(1.0);
                sink.set_volume(0.1 + value * 0.1);
            }
            UnsetEffect {} => {
                sink.set_volume(0.1);
            }
            _ => {}
        }
    }
}
