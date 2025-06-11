export const WRITING_PROMPTS = {
  fantasy: [
    "A cartographer discovers that the maps they draw become real places.",
    "Magic has suddenly stopped working everywhere except in your protagonist's hometown.",
    "Your character finds a door in their basement that wasn't there yesterday.",
    "A dragon applies for a job at the local library.",
    "Every time someone lies in your world, a flower wilts somewhere.",
    "Your character inherits a magical item that only works for terrible purposes.",
    "A young mage's spells keep turning people into different versions of themselves.",
    "The last bookstore in the realm is actually a portal hub to other worlds."
  ],
  
  scifi: [
    "Humanity's first AI decides its purpose is to become the galaxy's best comedian.",
    "Time travel exists, but you can only travel backwards 37 minutes.",
    "Your character receives messages from themselves in parallel dimensions.",
    "The first human colony ship arrives at a planet already inhabited by... humans.",
    "A space janitor discovers that their cleaning supplies can alter reality.",
    "Memory storage has become so cheap that people collect other people's memories.",
    "Your character's job is to debug the simulation we're all living in.",
    "Aliens arrive on Earth but they're only interested in our reality TV shows."
  ],
  
  contemporary: [
    "Your character starts receiving reviews for a life they're not living.",
    "Every coffee shop in the city starts serving the same mysterious drink.",
    "Your protagonist's reflection starts acting independently.",
    "A social media influencer discovers their followers don't actually exist.",
    "Your character can taste colors whenever someone lies to them.",
    "The neighborhood cats have been delivering mysterious packages.",
    "Your protagonist's GPS keeps directing them to places that don't exist.",
    "Every elevator in the building goes to different floors for your character."
  ],
  
  mystery: [
    "The victim in a murder case keeps appearing in different people's dreams.",
    "Your detective realizes they're investigating their own crime from the future.",
    "Every witness to a crime tells the exact same story, word for word.",
    "A thief only steals things that haven't been missed yet.",
    "Your protagonist receives clues to a crime that hasn't happened yet.",
    "The murder weapon is something that shouldn't be able to kill anyone.",
    "Your detective discovers that the evidence keeps changing when no one's looking.",
    "Every person in town has the same alibi for a crime that happened 50 years ago."
  ],
  
  romance: [
    "Your character keeps meeting the same person in different lifetimes, but they're always on opposite sides.",
    "Two rival food truck owners are forced to share the same corner for a month.",
    "Your protagonist falls for someone through a wrong-number text exchange.",
    "A wedding planner and a divorce lawyer are assigned neighboring offices.",
    "Your character discovers their online gaming nemesis lives next door.",
    "Two people are stuck in a time loop on the worst first date ever.",
    "Your protagonist must pretend to date their best friend's sibling for a family wedding.",
    "A breakup specialist falls for someone who's hired them to end a relationship."
  ],
  
  horror: [
    "Your character realizes that everyone they've ever 'lost touch with' has actually disappeared.",
    "The new house's previous owner left increasingly frantic notes in impossible places.",
    "Your protagonist discovers their childhood imaginary friend was protecting them from something real.",
    "Every night at 3:17 AM, your character receives a phone call from their own number.",
    "The town's children have started aging backwards, but only the adults notice.",
    "Your character finds photos of themselves in places they've never been.",
    "The local newspaper keeps printing obituaries for people who are still alive.",
    "Your protagonist's dreams start showing up on other people's security cameras."
  ],
  
  general: [
    "Write about a character who collects lost things.",
    "Your protagonist discovers a room in their house they've never seen before.",
    "Write about someone who speaks a language no one else understands.",
    "Your character finds a letter addressed to them from 100 years ago.",
    "Write about a place where it's always 3 PM on a Tuesday.",
    "Your protagonist has a job that doesn't officially exist.",
    "Write about someone who can only tell the truth on Wednesdays.",
    "Your character discovers that their least favorite song holds a secret message."
  ]
};

export const WRITING_PROJECTS = {
  novel: { name: "Novel", description: "Long-form fiction project", minWords: 50000 },
  novella: { name: "Novella", description: "Medium-length story", minWords: 17500 },
  shortStory: { name: "Short Story", description: "Complete short fiction", minWords: 1000 },
  poetry: { name: "Poetry", description: "Verse and poetic works", minWords: 100 },
  screenplay: { name: "Screenplay", description: "Script for film or TV", minWords: 15000 },
  blog: { name: "Blog Post", description: "Online article or post", minWords: 500 },
  journal: { name: "Journal", description: "Personal writing and reflection", minWords: 250 },
  academic: { name: "Academic", description: "Research papers, essays", minWords: 2000 },
  technical: { name: "Technical", description: "Documentation, manuals", minWords: 1000 },
  other: { name: "Other", description: "Miscellaneous writing", minWords: 300 }
};

export const analyticsUtils = {
  calculateProductivityInsights: (sessions) => {
    // ... implementation from the previous artifact
  },
  
  formatTimeOfDay: (hour) => {
    // ... implementation
  },
  
  calculateConsistencyScore: (sessions) => {
    // ... implementation  
  },
  
  generateRecommendations: (insights, sessions) => {
    // ... implementation
  },
  
  getWritingPatterns: (sessions) => {
    // ... implementation
  }
};
