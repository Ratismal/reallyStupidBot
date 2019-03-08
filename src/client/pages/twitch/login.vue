<template>
	<main>
		aaaaaaaaaaaaa
	</main>
</template>

<script>
export default {
	mounted() {
		if (process.client) {
			console.log(this.$route.query, window.location.href);
			if (!this.$route.query.code) {
				let redirect = encodeURIComponent(window.location.href);
				console.log(redirect);
				// return;
				let scopes = encodeURIComponent('bits:read channel:read:subscriptions user:edit user:edit:broadcast user:read:broadcast channel_check_subscription channel_editor channel_feed_edit channel_feed_read channel_subscriptions');
				window.location.href = 'https://id.twitch.tv/oauth2/authorize?client_id=s5jnp0wh62baxiwh798db87o5meqem'
					+ `&redirect_uri=${redirect}`
					+ `&response_type=code`
					+ `&scope=${scopes}`;
			} else {
				console.log(this.$route.query.code);
			}
		}
	},
};
</script>
