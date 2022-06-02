import ll from '../src/client';

import { LLtestLogin } from './connector';

/*
    Inizialize test for connection
*/

LLtestLogin().catch((error) => console.error);
