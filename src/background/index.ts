import ArchiveBoxArchiver from "../common/services/archiver"
import SyncedConfig from "../common/services/config"
import ChromeSyncStorage from "../common/services/storage"
import DomainList from "../common/services/domainList"
import IArchiver from "../common/interfaces/archiver"
import { GlobalConfigKey } from "../common/interfaces/config"
import { v4 } from "uuid"
import { ListType } from "../common/interfaces/domainList"

async function main() {
  const storage = new ChromeSyncStorage()
  const config = new SyncedConfig(storage)
  const domainList = new DomainList(storage)

  const archiver: IArchiver = new ArchiveBoxArchiver(domainList, config)

  const defaultTitle = "ArchiveBox"

  archiver.on("queuedUrlsChanged", newCount => {
    if (newCount > 0) {
      chrome.browserAction.setBadgeText({
        text: newCount.toString()
      })
  
      chrome.browserAction.setTitle({
        title: `${defaultTitle} - archiving ${newCount} page${newCount > 1 ? "s" : ""}`
      })
    } else {
      chrome.browserAction.setBadgeText({
        text: ""
      })
  
      chrome.browserAction.setTitle({
        title: defaultTitle
      })
    }
  })

  chrome.history.onVisited.addListener(async historyItem => {
    const shouldArchive = await archiver.shouldArchive(historyItem.url)
    if (!shouldArchive) return

    await archiver.queueForArchival(historyItem.url)
  })

  await chrome.alarms.clearAll()

  chrome.alarms.create({
    periodInMinutes: 15
  })

  chrome.alarms.onAlarm.addListener(async () => {
    await archiver.submitQueue()
  })

  chrome.contextMenus.create({
    id: "flushQueue",
    title: "Flush URL Queue",
    contexts: [ "browser_action" ],
    onclick: async () => {
      await archiver.submitQueue()
    }
  })
}

main()

export default main
