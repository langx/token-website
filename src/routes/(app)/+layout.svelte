<script lang="ts">
	import "../../app.css";
	import Header from "$lib/components/Global/Header.svelte";
	import Footer from "$lib/components/Global/Footer.svelte";
</script>

<!--add the dark class to change from dark to light mode-->
<!--this example below shows how to change the background color from dark to light mode-->
<!--the dark:bg-gray-800 class will change the background color to gray-800 when dark mode is enabled-->
<!--the bg-gray-100 class will change the background color to gray-100 when dark mode is disabled-->
<!--<div class="dark:bg-gray-800 bg-gray-100"></div>-->

<Header />

<main>
	<slot />
</main>

<Footer />

<div id="coins">
	<img width="152" src="images/coin-1.png" role="presentation" alt="" />
	<img width="148" src="images/coin-2.png" role="presentation" alt="" />
	<img width="150" src="images/coin-3.png" role="presentation" alt="" />
	<img width="152" src="images/coin-4.png" role="presentation" alt="" />
	<img width="130" src="images/coin-5.png" role="presentation" alt="" />
	<img width="76" src="images/coin-6.png" role="presentation" alt=""  />
	<img width="154" src="images/coin-7.png" role="presentation" alt=""  />
	<img width="130" src="images/coin-5.png" role="presentation" alt=""  />
	<img width="76" src="images/coin-6.png" role="presentation" alt=""  />
	<img width="154" src="images/coin-7.png" role="presentation" alt=""  />
</div>

<style lang="postcss">
	:global(body) {
		background-color: #ffc409;
		font-family: 'Comfortaa', sans-serif;
	}
</style>