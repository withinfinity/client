// import { Obelisk } from '@0xobelisk/client';
// import { NetworkType, SuiTxArgument } from '@0xobelisk/client/src/types';
// import { TransactionBlock } from '@0xobelisk/client';
// import { initialize } from '@0xobelisk/client';


// type DataItem = [number[], string];
// function formatData(data: DataItem[]): string {
//     const formattedData: string[] = [];

//     data.forEach(([values, format]) => {
//         let formattedValue: string;

//         if (format === '0x1::string::String') {
//             formattedValue = values.map((num) => String.fromCharCode(num)).join('');
//         } else if (format === 'bool') {
//             formattedValue = values[0] !== 0 ? 'true' : 'false';
//         } else if (format === 'u64') {
//             const u64Value = new DataView(new ArrayBuffer(8));
//             values.forEach((num, index) => u64Value.setUint8(index, num));
//             formattedValue = u64Value.getBigUint64(0).toString();
//         } else {
//             formattedValue = 'Unknown Format';
//         }

//         formattedData.push(formattedValue);
//     });

//     return formattedData.join('\n');
// }

// async function init() {
//     const network = 'testnet'
//     const packageId = '0x6afbf113a5872b781a2a0068b95c0d9d0ee89428518fdd65f862c841eab45b82'
// }