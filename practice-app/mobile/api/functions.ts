import tokenManager from "@/services/tokenManager";

export const getMyScore = async() => {
    try {
        const response = await tokenManager.authenticatedFetch("v1/waste/scores/me");
        if (!response.ok) {
            throw new Error("getMyScore call failed");
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error(error);
    }
}

export const getUserProfile = async() => {
    try {
        const response = await tokenManager.authenticatedFetch("/user/me/");
        if (!response.ok) {
            throw new Error("getUserProfile call failed");
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error(error);
    }
}