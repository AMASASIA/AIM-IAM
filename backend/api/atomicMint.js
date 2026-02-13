const express = require('express');
const router = express.Router();
const { uploadJSON } = require('../services/ipfs');
const { executeAtomicMint } = require('../services/atomic');
const { db } = require('../firebase-backend');
const { ref, push, set, child } = require("firebase/database");

router.post('/', async (req, res) => {
    try {
        const { address, metadata, rally, aiLog } = req.body;

        console.log(`[Atomic API] 🚀 Processing request for ${address}`);

        // 1. Upload Metadata to IPFS (The "Soul" of the content)
        const ipfsResult = await uploadJSON(metadata);
        console.log(`[Atomic API] 📦 IPFS Metadata: ${ipfsResult.url}`);

        // 2. Execute Atomic Mint on Blockchain (The "Body" and "Proof")
        // Calls AtomicMint.sol -> Mints SBT + NFT + TBA in one TX
        const chainResult = await executeAtomicMint(address, ipfsResult.url);
        console.log(`[Atomic API] ⛓️ Blockchain Tx: ${chainResult.tx}`);

        // 3. Update Sync Database (Rally, Map, AI Logs) (The "Memory")
        // PERSISTENCE: Now using Firebase instead of memory

        // Save Rally State
        if (rally) {
            await set(ref(db, `rally/${address}`), rally);
        }

        // Add Map Pin
        await push(ref(db, 'pins'), {
            address,
            tx: chainResult.tx,
            location: metadata.location || "Unknown",
            energy: aiLog?.energyScore || 0.5,
            timestamp: Date.now()
        });

        // Store AI Log
        await push(ref(db, `logs/${address}`), {
            log: aiLog,
            prompt: metadata.description,
            timestamp: Date.now()
        });

        // 4. Return unified success response
        res.json({
            success: true,
            transaction: chainResult,
            ipfs: ipfsResult,
            rally: rally, // Echo back current rally state
            message: "AIM3 Atomic Mint Complete: Physical, Digital, and AI states synchronized."
        });

    } catch (error) {
        console.error("[Atomic API] ❌ Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});


const { getData } = require('../firebase-backend'); // Assumption: need helper or direct usage
const { get } = require("firebase/database");

router.get('/pins', async (req, res) => { // Async now
    try {
        const snapshot = await get(ref(db, 'pins'));
        if (snapshot.exists()) {
            res.json(Object.values(snapshot.val()));
        } else {
            res.json([]);
        }
    } catch (e) {
        res.status(500).json([]);
    }
});

module.exports = router;
