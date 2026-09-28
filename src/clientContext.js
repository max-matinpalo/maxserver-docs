import { createContext } from 'preact';

// Test request settings shared by all panels: server base and Bearer token
export const ClientContext = createContext({ base: '', token: '', setToken: () => {} });
