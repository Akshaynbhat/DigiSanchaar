
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Link as LinkIcon, Hash } from "lucide-react";

async function getBlockchainData() {
    const { db } = getFirebaseAdmin();
    const blockchainSnapshot = await db.collection('blockchain').orderBy('id', 'desc').get();
    
    if (blockchainSnapshot.empty) {
        return [];
    }

    return blockchainSnapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore Timestamp to a serializable format (ISO string)
        return {
            ...data,
            timestamp: data.timestamp.toDate().toISOString(),
        };
    });
}

const TransactionDetail = ({ tx }: { tx: any }) => {
    return (
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md text-xs space-y-1">
           <p><strong className="text-gray-500 dark:text-gray-400">Type:</strong> <span className="font-semibold text-primary">{tx.type}</span></p>
           {tx.userId && <p><strong className="text-gray-500 dark:text-gray-400">User ID:</strong> {tx.userId}</p>}
           {tx.digiId && <p><strong className="text-gray-500 dark:text-gray-400">Digi-ID:</strong> {tx.digiId}</p>}
           {tx.tripId && <p><strong className="text-gray-500 dark:text-gray-400">Trip ID:</strong> {tx.tripId}</p>}
           {tx.memberAdded && <p><strong className="text-gray-500 dark:text-gray-400">Member Added:</strong> {tx.memberAdded}</p>}
        </div>
    );
};


export default async function BlockchainRecordsPage() {

    const blocks = await getBlockchainData();

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Digital ID & Trip Records</h1>
                <p className="text-muted-foreground">This is a secure, immutable log of all critical system events, simulated using blockchain principles.</p>
            </header>

            {blocks.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        No blockchain records found. Perform an action like creating a user or a trip to generate the first block.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {blocks.map(block => (
                        <Card key={block.id} className="font-mono text-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 font-sans">
                                    <Hash className="size-5 text-primary"/>
                                    Block #{block.id}
                                </CardTitle>
                                <CardDescription className="font-sans">
                                    Mined on: {new Date(block.timestamp).toLocaleString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold font-sans mb-2 flex items-center gap-2"><Users className="size-4"/> Transactions</h4>
                                    <div className="space-y-2">
                                        {block.transactions.map((tx: any, index: number) => (
                                            <TransactionDetail key={index} tx={tx} />
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                     <div className="flex items-start gap-2">
                                        <LinkIcon className="size-4 text-muted-foreground mt-1"/>
                                        <div>
                                            <p className="font-semibold font-sans text-xs text-muted-foreground">Previous Hash</p>
                                            <p className="break-all text-xs">{block.previousHash}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Hash className="size-4 text-muted-foreground mt-1"/>
                                        <div>
                                            <p className="font-semibold font-sans text-xs text-muted-foreground">Current Hash</p>
                                            <p className="break-all text-xs">{block.hash}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
