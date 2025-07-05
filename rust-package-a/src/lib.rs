#[derive(Debug)]
pub struct Greeting<'a> {
    pub message: &'a str,
}

impl<'a> Greeting<'a> {
    pub fn new(message: &'a str) -> Self {
        Self { message }
    }
}
