import { generateCommunityTypeScript } from "./udt";

export function createCommunityObject(
    creatorAddress: string,
    name: string,
    description: string,
    guidelines: string,
    mintPrice: string
) {

    const guidelinesArray = guidelines.split("\n").map(rule => rule.trim()).filter(Boolean);

    const typescript = generateCommunityTypeScript(creatorAddress);

    return {
        id: typescript.args,
        name,
        description,
        guidelines: guidelinesArray,
        mintPrice: parseFloat(mintPrice),
        udtTypeScript: typescript
    }

} 