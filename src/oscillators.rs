use super::{ONE_OVER_RATE, SAMPLE_RATE};
use rodio::Source;

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

        let lfo_strength = self.freq * 0.2;

        // sine with LFO modulation
        let sample =
            (t * 2.0 * std::f32::consts::PI * self.freq * ONE_OVER_RATE
                + lfo_strength * (self.lfo)(t))
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
        let lfo_strength = 0.2 / self.period;

        let sample = 1.0
            * (((t * ONE_OVER_RATE + lfo_strength * (self.lfo)(t))
                % self.period)
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
