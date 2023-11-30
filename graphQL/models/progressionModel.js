import mongoose from 'mongoose';

const Chord = new mongoose.Schema({
    bars: String,
    chord_name: String,
    notes: [String]
});

const Progression = new mongoose.Schema({
    chords: [Chord],
    explanation: String,
    similar_song: String,
    brief_description: String
});

const ProgressionSchema = new mongoose.Schema({
    userID: String,
    creationTime: {
        day: String,
        time: String
    },
    prog: Progression
});

export default mongoose.model('Progressions', ProgressionSchema);
