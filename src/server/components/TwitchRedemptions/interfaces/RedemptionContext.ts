import ChatClient, { PrivateMessage } from 'twitch-chat-client';
import TwitchClient from 'twitch';
import { Twitch } from '../../Twitch';
import { PubSubRedemptionMessage } from 'twitch-pubsub-client/lib';

export interface RedemptionContext {
	message: PubSubRedemptionMessage
	client: ChatClient;
	twitch: TwitchClient;
	Twitch: Twitch;
}
