use rodio::Source;
use std::{fs::File, io::BufReader, time::Duration};

const SAMPLE_RATE: u32 = 44_100;
const ONE_OVER_RATE: f32 = 1.0 / SAMPLE_RATE as f32;

struct Sine {
    t: u32,
    freq: f32,
}

impl Iterator for Sine {
    type Item = f32;

    fn next(&mut self) -> Option<Self::Item> {
        let t = self.t as f32;
        self.t += 1;

        let low_freq = 0.4;
        let I = self.freq * 0.2;

        // sine with LFO modulation
        let sample = (t * 2.0 * 3.14 * self.freq * ONE_OVER_RATE
            + I * (2.0 * 3.14 * low_freq * t * ONE_OVER_RATE).sin())
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

struct Sawtooth {
    t: u32,
    period: f32,
}

impl Iterator for Sawtooth {
    type Item = f32;

    fn next(&mut self) -> Option<Self::Item> {
        let t = self.t as f32;
        self.t += 1;

        let sample = 0.2
            * (((t * ONE_OVER_RATE) % self.period) / self.period * 2.0 - 1.0);

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

fn main() {
    let (stream, stream_handle) = rodio::OutputStream::try_default().unwrap();

    let sine = Sine { t: 0, freq: 440.0 };
    let sawtooth = Sawtooth {
        t: 0,
        period: 1.0 / 440.0,
    };

    let sink = rodio::Sink::try_new(&stream_handle).unwrap();
    sink.append(sine.take_duration(Duration::from_secs(2)));
    sink.append(sawtooth.take_duration(Duration::from_secs(2)));

    loop {}
}
