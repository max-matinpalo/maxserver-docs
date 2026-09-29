import { createContext } from 'preact';

// The raw OpenAPI document, for resolving $ref deep inside schemas
export const DocContext = createContext({});

// Test request settings shared by all panels: server base and Bearer token
export const ClientContext = createContext({ base: '', token: '', setToken: () => {} });

// The theme shown, light or dark, for views that follow it
export const ThemeContext = createContext('light');
