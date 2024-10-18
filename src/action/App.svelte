<script>
  import DomainLists from "./components/DomainLists.svelte"
  import Config from "./components/Config.svelte"

  let archiveMode

  function onArchiveModeChanged(newMode) {
    archiveMode = newMode
  }

import ArchiveBoxArchiver from "../common/services/archiver"
import SyncedConfig from "../common/services/config"
import ChromeSyncStorage from "../common/services/storage"
import DomainList from "../common/services/domainList"
import IArchiver from "../common/interfaces/archiver"
  function archiveNow() {
    chrome.tabs.query({active: true, currentWindow: true}, async tabs => {
      const storage = new ChromeSyncStorage()
      const config = new SyncedConfig(storage)
      const domainList = new DomainList(storage)
      const archiver = new ArchiveBoxArchiver(domainList, config)
      await archiver.archiveImmediately(tabs[0].url)
    });
  }
</script>

<div class="main">
  <Config {onArchiveModeChanged} />
  <hr>
  <button on:click="{archiveNow}">Archive now</button>
  <DomainLists {archiveMode} />
</div>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(html), :global(body) {
    margin: 0;
  }

  .main {
    width: 400px;
    padding: 10px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  :global(a) {
    color: #3bcfff;
  }

  hr {
    margin: 10px 0;
    border: none;
    border-top: 1px solid lightgray;
  }

  @media(prefers-color-scheme: dark) {
    .main {
      background: #2d2d2d;
      color: #FFF;
    }

    hr {
      border-color: #444444;
    }
  }
</style>
