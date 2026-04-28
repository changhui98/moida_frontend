export type GroupTab = 'posts' | 'members' | 'schedule'

interface GroupDetailTabsProps {
  activeTab: GroupTab
  onChange: (tab: GroupTab) => void
}

const TABS: { key: GroupTab; label: string; icon: string }[] = [
  { key: 'posts', label: '게시글', icon: '📋' },
  { key: 'members', label: '멤버', icon: '👥' },
  { key: 'schedule', label: '일정', icon: '📅' },
]

import styles from './GroupDetailTabs.module.css'

export function GroupDetailTabs({ activeTab, onChange }: GroupDetailTabsProps) {
  return (
    <nav className={styles.tabNav} role="tablist" aria-label="모임 상세 탭">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.key}
          className={`${styles.tabBtn} ${activeTab === tab.key ? styles.tabBtnActive : ''}`}
          onClick={() => onChange(tab.key)}
        >
          <span className={styles.tabIcon}>{tab.icon}</span>
          <span className={styles.tabLabel}>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
