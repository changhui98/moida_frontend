import type { GroupMemberResponse } from '../../types/group'
import styles from './TabMemberList.module.css'

interface TabMemberListProps {
  members: GroupMemberResponse[]
  isLeader: boolean
  actionLoading: boolean
  onKick: (username: string, nickname: string) => void
}

export function TabMemberList({ members, isLeader, actionLoading, onKick }: TabMemberListProps) {
  return (
    <section className={styles.membersSection}>
      <h2 className={styles.sectionTitle}>멤버 ({members.length})</h2>
      <ul className={styles.memberList}>
        {members.map((member) => (
          <li key={member.userId} className={styles.memberItem}>
            <span className={`avatar ${styles.memberAvatar}`}>
              {member.nickname.charAt(0).toUpperCase()}
            </span>
            <div className={styles.memberInfo}>
              <span className={styles.memberNickname}>{member.nickname}</span>
              <span className={styles.memberUsername}>@{member.username}</span>
            </div>
            {member.role === 'LEADER' && (
              <span className={styles.leaderBadge}>모임장</span>
            )}
            {isLeader && member.role !== 'LEADER' && (
              <button
                type="button"
                className={styles.kickButton}
                onClick={() => onKick(member.username, member.nickname)}
                disabled={actionLoading}
              >
                강퇴
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
