export interface QuestSelectionSnapshot<Id extends string> {
  profileId?: string;
  order: readonly Id[];
  completed: readonly Id[];
  active: readonly Id[];
  available: readonly Id[];
}

/** Local browsing state. Only confirmed snapshots can advance the selected quest. */
export class QuestSelection<Id extends string> {
  selected?: Id;
  private profileId?: string;
  private completed = new Set<Id>();
  private receivedSnapshot = false;

  select(id: Id) { this.selected = id; }

  reset() {
    this.selected = undefined;
    this.profileId = undefined;
    this.completed.clear();
    this.receivedSnapshot = false;
  }

  update(snapshot: QuestSelectionSnapshot<Id>): Id | undefined {
    if (snapshot.profileId && this.profileId && snapshot.profileId !== this.profileId) this.reset();
    if (snapshot.profileId) this.profileId = snapshot.profileId;
    const completed = new Set(snapshot.completed);
    const advanced = this.receivedSnapshot && this.selected !== undefined && !this.completed.has(this.selected) && completed.has(this.selected);
    if (this.selected === undefined || !snapshot.order.includes(this.selected) || advanced) {
      const remaining = snapshot.order.filter(id => !completed.has(id));
      this.selected = remaining.find(id => snapshot.active.includes(id))
        ?? remaining.find(id => snapshot.available.includes(id))
        ?? remaining[0]
        ?? this.selected
        ?? snapshot.order.at(-1);
    }
    this.completed = completed;
    this.receivedSnapshot = true;
    return this.selected;
  }
}
