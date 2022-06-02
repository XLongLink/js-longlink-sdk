import ll from '../src/client';

import { LLtestLogin } from './connector';

/*
    Inizialize test for connection
*/
const token =
    'gqNzaWfEQJl/AuaNxPVr97p2mhREzGD2fdT6+0/IcPTyhuCM3000MTVS77VSkKJi1rAUnL4hDCaG6py+BjnwbL6H25TzzQ6jdHhuiKJmdgqjZ2VurG1haW5uZXQtdjEuMKJnaMQgwGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit+ibHYKpG5vdGXEMGh0dHBzOi8vc3RhdGVsZXNzLWF1dGgudmVyY2VsLmFwcC8gMTY1NDI3MjU2NzgyOaNyY3bEIOsy1RyxI4xlsBLOabRc9YqQ3Je0a5imf33Nq6on3JZOo3NuZMQg6zLVHLEjjGWwEs5ptFz1ipDcl7RrmKZ/fc2rqifclk6kdHlwZaNwYXk=';
const account = '5MZNKHFREOGGLMASZZU3IXHVRKINZF5UNOMKM735ZWV2UJ64SZHILRDGJA';
const fake = '2JBQSMWAZANNM5U2P2DPCBVJ7VYLRT7LA2AOP7JGUF4HIBV6XBA3TBGXGA';

ll.on('login', () => {
    console.log('logged');
    console.log(ll.wallet);
});

ll.on('authenticate', () => {
    console.log('authenticate');
    ll.verifyToken().then((a) => {
        console.log(a);
    });
});

async function main() {
    await LLtestLogin();
}

main().catch((error) => console.error);
