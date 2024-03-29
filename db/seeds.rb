class RandomGaussian
  attr_accessor :mean, :stddev
  def initialize(mean, stddev, rand_helper = lambda { Kernel.rand })
    @rand_helper = rand_helper
    @mean = mean
    @stddev = stddev    
    @valid = false
    @next = 0
  end

  def rand
    if @valid then
      @valid = false
      return @next
    else
      @valid = true
      x, y = self.class.gaussian(@mean, @stddev, @rand_helper)
      @next = y
      return x
    end
  end

  private
  def self.gaussian(mean, stddev, rand)
    theta = 2 * Math::PI * rand.call
    rho = Math.sqrt(-2 * Math.log(1 - rand.call))
    scale = stddev * rho
    x = mean + scale * Math.cos(theta)
    y = mean + scale * Math.sin(theta)
    return x, y
  end
end

  personas_arr = [
    "Corporate power user",
    "Freelance power user",
    "Frequent use in administration",
    "Moderate private use"
    ]
  personas_skill = [
    (rand(70..100))/100.0,
    (rand(60..80))/100.0,
    (rand(40..65))/100.0,
    (rand(30..50))/100.0
    ]

  tasks_arr = [
    "Change your default signature",
    "Add an address to a mailing list",
    "Create an appointment in a shared calendar",
    "Export your address book",
    "Restore a deleted draft",
    "Create a new IMAP account",
    "Create a new task for a colleague",
    "Add a domain to the spam black list"
    ]
  tasks_difficulty = [
    (rand(20..40)) / 100.0,
    (rand(40..50)) / 100.0,
    (rand(70..90)) / 100.0,
    (rand(50..80)) / 100.0,
    (rand(15..30)) / 100.0,
    (rand(90..100)) / 100.0,
    (rand(50..60)) / 100.0,
    (rand(40..80)) / 100.0
    ]
  marker_arr = [
    "ADRESSBOOK",
    "IRRITATION",
    "LOST",
    "WRONG",
    "INBOX-VIEW"
    ]
  participants_arr = [
    "Sophia", "Phillipp", "Karol", "Christian", "Mathias", "Stefanie", "Thorsten", 
    "Leonie", "Pablo", "Peter", "Johannes", "Simone", "Junda", "Günther", "Hendrik", "Lars", "Astrid", "Allison"
    ]
  participants_arr = [
    "Peter", "Johannes", "Simone", "Junda", "Günther", "Hendrik", "Lars", 
   "Astrid", "Allison", "Sophia", "Phillipp", "Karol", "Christian", "Mathias", "Stefanie", "Thorsten", "Leonie", "Pablo"
    ]
  persona_distr = [
    1,1,2,2,3,3,3,4,4,1,1,2,2,3,3,3,4,4
    ].sort
  

  rdSat = RandomGaussian.new(3.5, 2)
  rdSum = RandomGaussian.new(0.5, 0.2)

  project = Project.create name: "Redesign E-Mail-Client-Oberfläche", customer: "SW Holding GmbH"
  
  pA = project.prototypes.create moniker: "Prototype A"
  pB = project.prototypes.create moniker: "Prototype B"
    
  tasks_arr.each do |tsk|
    project.tasks.create name: tsk
  end
  
  personas_arr.each do |pers|
    Persona.create( moniker: pers )
  end
  
  participants_arr.each do |part|
    Participant.create( name: part, persona_id: persona_distr[participants_arr.index(part)])#, project_id: 1 )
  end

  Task.all.each do |t|
    difficulty = tasks_difficulty[tasks_arr.index(t.name)]
    base_tasktime = rand(150..200)*difficulty
    Participant.all.each do |p|
      skill = [personas_skill[p.persona_id - 1] + (rand(-10..10) / 50.0), 1].min.abs 
      passSum = rdSum.rand
      passSat = [rdSat.rand, 5].min.abs
      compl = difficulty < skill ? true : false
      tt = compl ? base_tasktime + (rand(10..30) / skill) : base_tasktime + (rand(60..100) / skill)
      pA.passes.create( 
          task_id: t.id,
          participant_id: p.id,
          sum: passSum,
          tasktime: tt, 
          satisfaction: compl ? passSat : passSat*0.6, 
          completed: compl
        )
      compl = difficulty*0.6 < skill ? true : false
      pB.passes.create(
          task_id: t.id,
          participant_id: p.id,
          sum: passSum,
          tasktime: tt+rand(-60..40), 
          satisfaction: compl ? passSat : passSat*0.6, 
          completed: compl
        )
    end
  end
  
  Pass.all.each do |pss|
    for i in pss.sum <0.5 ? 0..rand(3..6) : 0..rand(1..3) do
      pss.markers.create(
          code: marker_arr.sample,
          severity: ["S0", "S1", "S2", "S3", "S4"].sample,
          position: (5 .. pss.tasktime).to_a.sample,
        )
    end
  end