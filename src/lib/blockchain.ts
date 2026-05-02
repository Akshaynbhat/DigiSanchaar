import { getFirebaseAdmin } from './firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import forge from 'node-forge';

const BLOCKCHAIN_COLLECTION = 'blockchain';
const GENESIS_BLOCK_ID = '0';

// Define the structure of a block
interface Block {
    id: number;
    timestamp: Timestamp;
    transactions: any[];
    previousHash: string;
    hash: string;
}

// Hashes a block's content
function createHash(id: number, timestamp: Timestamp, transactions: any[], previousHash: string): string {
    const sha256 = forge.md.sha256.create();
    sha256.update(id.toString() + timestamp.toMillis().toString() + JSON.stringify(transactions) + previousHash);
    return sha256.digest().toHex();
}

// Creates the very first block in the chain
async function createGenesisBlock(): Promise<Block> {
    console.log('Creating Genesis Block...');
    const { db } = getFirebaseAdmin();
    const timestamp = Timestamp.now();
    const transactions = [{ type: 'GENESIS' }];
    const previousHash = '0';
    const id = 0;
    const hash = createHash(id, timestamp, transactions, previousHash);
    
    const genesisBlock: Block = { id, timestamp, transactions, previousHash, hash };

    await db.collection(BLOCKCHAIN_COLLECTION).doc(GENESIS_BLOCK_ID).set(genesisBlock);
    console.log('Genesis Block created and stored.');
    return genesisBlock;
}

// Gets the most recent block from the blockchain
async function getLatestBlock(): Promise<Block> {
    const { db } = getFirebaseAdmin();
    const blockchainRef = db.collection(BLOCKCHAIN_COLLECTION);
    
    const latestBlockQuery = await blockchainRef.orderBy('id', 'desc').limit(1).get();

    if (latestBlockQuery.empty) {
        // If the blockchain is empty, create and return the genesis block
        return await createGenesisBlock();
    }

    return latestBlockQuery.docs[0].data() as Block;
}

/**
 * Adds a new transaction to the simulated blockchain.
 * It fetches the latest block, creates a new block with the new transaction,
 * hashes it, and saves it to Firestore.
 * @param transaction - The transaction data to add to the new block.
 */
export async function addTransaction(transaction: any) {
    try {
        console.log('Adding transaction to blockchain:', transaction.type);
        const { db } = getFirebaseAdmin();
        const latestBlock = await getLatestBlock();
        
        const newBlockId = latestBlock.id + 1;
        const newTimestamp = Timestamp.now();
        const newTransactions = [transaction];
        const newPreviousHash = latestBlock.hash;
        
        const newHash = createHash(newBlockId, newTimestamp, newTransactions, newPreviousHash);
        
        const newBlock: Block = {
            id: newBlockId,
            timestamp: newTimestamp,
            transactions: newTransactions,
            previousHash: newPreviousHash,
            hash: newHash,
        };

        // The document ID will be the block's height (ID) as a string
        await db.collection(BLOCKCHAIN_COLLECTION).doc(newBlockId.toString()).set(newBlock);
        console.log(`Block #${newBlockId} added to the blockchain successfully.`);
        
    } catch (error) {
        console.error('Error adding block to blockchain:', error);
        // In a real app, you might want more robust error handling, like a retry mechanism
        // or logging to a dedicated error monitoring service.
        throw new Error('Failed to add transaction to the blockchain.');
    }
}
