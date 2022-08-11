// * Declare a BOT_TOKEN var for process.env declerations to get Intellisense

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			BOT_TOKEN: string;
		}
	}
}

export {};
