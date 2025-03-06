import api from "./axiosInstance";
import { Purchase } from "../Types";

export interface PurchaseResponse {
  purchases: Purchase[];
  next?: string;
  previous?: string;
}

export const getGroupPurchases = async (limit = 50, offset = 0): Promise<PurchaseResponse> => {

  try {
    const response = await api.get(`/group/purchase`, {
      params: { limit, offset },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch purchases");
  }
};
