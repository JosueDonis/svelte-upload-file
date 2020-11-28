<script>
import UploadFiles from "./UploadFiles.svelte"
</script>

<main>
	<UploadFiles />

</main>

<style>
	main {
		text-align: center;
		max-width: 240px;
		margin: auto;
		align-items: center;
		justify-content: center;
		display: grid;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>