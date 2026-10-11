class BRC333AudioCat {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    async createConcatenatedBuffer(audioData) {
        const audioBuffers = [];
        
        for (const inscriptionId of audioData.clips) {
            try {
                console.log('inscriptionId',inscriptionId);
                const audioResponse = await fetch(`https://ordinals.fractalbitcoin.io/content/${inscriptionId}`);
                if (!audioResponse.ok) {
                    throw new Error(`Network response was not ok: ${audioResponse.statusText}`);
                }
                const arrayBuffer = await audioResponse.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                audioBuffers.push(audioBuffer);
            } catch (error) {
                console.error(`Failed to decode audio data for ${inscriptionId}:`, error);
                continue;
            }
        }

        const totalLength = audioBuffers.reduce((sum, buffer) => sum + buffer.length, 0);
        const combinedBuffer = this.audioContext.createBuffer(
            audioBuffers[0].numberOfChannels,
            totalLength,
            audioBuffers[0].sampleRate
        );

        let offset = 0;
        for (const buffer of audioBuffers) {
            for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
                const channelData = buffer.getChannelData(channel);
                combinedBuffer.copyToChannel(channelData, channel, offset);
            }
            offset += buffer.length;
        }

        // Attach metadata
        combinedBuffer.metadata = {
            title: audioData.title,
            artist: audioData.artist,
            album: audioData.album,
            genre: audioData.genre,
            year: audioData.year
        };

        return combinedBuffer;
    }

    playBuffer(buffer) {
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start();
        return source;
    }
}

window.BRC333AudioCat = BRC333AudioCat;