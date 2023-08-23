import { _decorator, Component, log, Node,find, sys,director } from 'cc';
const { ccclass, property } = _decorator;


type DataItem = [number[], string];

@ccclass('sui')
export class sui extends Component {


    // public sui: any

    async start() {
        console.log("1")
        // @ts-ignore
        const sui  = window.sui;
         // @ts-ignore
        const obelisk = window.obelisk;
        console.log(obelisk);
    }

    async sui_account_create(){
        // @ts-ignore
        const sui  = window.sui;
        const decode = JSON.parse(sys.localStorage.getItem('withinfinity-userWalletData'));
        if (decode == null){
            const keypair = new sui.Ed25519Keypair();
            const wallet = keypair.export()
            const code = JSON.stringify(wallet)
            sys.localStorage.setItem('withinfinity-userWalletData', code); 
        }else{
            director.loadScene('claim_pet');
        }

    }

    // async import_sui_account(){
    //     // @ts-ignore
    //     const sui  = window.sui;
    //     const decode = JSON.parse(sys.localStorage.getItem('withinfinity-userWalletData'));
    //     if (decode == null){
    //         const keypair = new sui.Ed25519Keypair();
    //         const wallet = keypair.export()
    //         const code = JSON.stringify(wallet)
    //         sys.localStorage.setItem('withinfinity-userWalletData', code); 
    //     }else{
    //         window.alert("你有账号了")
    //     }

    // }


    formatData(data: DataItem[]): string {
        const formattedData: string[] = [];
    
        data.forEach(([values, format]) => {
            let formattedValue: string;
    
            if (format === '0x1::string::String') {
                formattedValue = values.map((num) => String.fromCharCode(num)).join('');
            } else if (format === 'bool') {
                formattedValue = values[0] !== 0 ? 'true' : 'false';
            } else if (format === 'u64') {
                const u64Value = new DataView(new ArrayBuffer(8));
                values.forEach((num, index) => u64Value.setUint8(index, num));
                formattedValue = u64Value.getBigUint64(0).toString();
            } else {
                formattedValue = 'Unknown Format';
            }
    
            formattedData.push(formattedValue);
        });
    
        return formattedData.join('\n');
    }

    async get_metadata(){
        // @ts-ignore
        const obelisk = window.obelisk;
        const network = 'testnet'
        const packageId = '0x6afbf113a5872b781a2a0068b95c0d9d0ee89428518fdd65f862c841eab45b82'
        const metadata = await obelisk.initialize(network, packageId);
        // new obelisk class
        const obelisk_sdk = new obelisk.Obelisk({
            networkType: network,
            packageId: packageId,
            metadata: metadata,
            // secretKey: privkey
        });

        const tx = new obelisk.TransactionBlock();

        const params = [
            tx.pure(
                '0x6fa43c68221960f942572905f3c198a5bccaa0700506b3b6bd83dd9b007e6324'
            ),
            tx.pure(
                '0xbf64721f0961a0426ccde6b8d9343e2cb2c26a105a5c33e57074580fd98b2cb1'
            ),
            tx.pure('0x6')
        ]

        const res1 = await obelisk_sdk.query.pet_system.get_pet_basic_info(tx, params);
        const input: DataItem[] = res1.results![0].returnValues!;
        const formattedOutput: string = this.formatData(input);
        console.log(formattedOutput);

    }

    update(deltaTime: number) {

    }
}

