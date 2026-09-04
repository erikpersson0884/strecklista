import { ApiScope, ApiGroupClient } from "../schemas/api";

const clientAdapter = {
    adaptScopes: (apiScopes: ApiScope[]): ClientScope[] => {
        return apiScopes;
    },

    adaptClient: (apiClient: ApiGroupClient): Client => {
        return apiClient;
    }
};

export default clientAdapter;
