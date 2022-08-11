// * 3rd Party Libs
import { PrismaClient } from "@prisma/client"

const doesChannelExist = async (channelID: string): Promise<boolean> => {
    const prisma = new PrismaClient();
    
    const getChannelEntries = await prisma.countStatus.findUnique({
        where: {
            channelID
        }
    });

    if(getChannelEntries) {
        return true;
    }
    else {
        return false;
    }
}

export { doesChannelExist }