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
    "Restore a deleted draft"
    ]
  tasks_difficulty = [
    (rand(50..60))/100.0,
    (rand(40..50))/100.0,
    (rand(70..90))/100.0,
    (rand(50..80))/100.0,
    (rand(40..60))/100.0 #/
    ]
  marker_arr = [
    "ANGER",
    "IRRITATION",
    "LOST",
    "CONFUSION",
    "ANNOYANCE"
    ]

  rdSat = RandomGaussian.new(3.5, 2)
  rdSum = RandomGaussian.new(0.5, 0.2)

  tasks_arr.each do |tsk|
    Task.create( name: tsk )
  end
  
  personas_arr.each do |pers|
    Persona.create( moniker: pers )  
  end
  
  Participant.create( name: "Sophia", persona_id: 1 )
  Participant.create( name: "Phillipp", persona_id: 1 )
  Participant.create( name: "Karol", persona_id: 2 )
  Participant.create( name: "Christian", persona_id: 2 )
  Participant.create( name: "Mathias", persona_id: 3 )
  Participant.create( name: "Stefanie", persona_id: 3 )
  Participant.create( name: "Thorsten", persona_id: 3 )
  Participant.create( name: "Leonie", persona_id: 4 )
  Participant.create( name: "Pablo", persona_id: 4 )

  Task.all.each do |t|
    difficulty = tasks_difficulty[tasks_arr.index(t.name)]
    base_tasktime = rand(150..200)*difficulty
    Participant.all.each do |p|
      skill = [personas_skill[p.persona_id - 1] + (rand(-10..10) / 50.0), 1].min.abs #/
      passSum = rdSum.rand
      passSat = [rdSat.rand, 5].min.abs
      compl = difficulty < skill ? true : false
      tt = compl ? base_tasktime + (rand(10..30) / skill) : base_tasktime + (rand(60..100) / skill)
      Pass.create( 
          task_id: t.id,
          participant_id: p.id,
          sum: passSum,
          tasktime: tt, #/
          satisfaction: compl ? passSat : passSat*0.6, #/
          completed: compl
        )
    end
  end
  
  Pass.all.each do |pss|
    for i in pss.sum <0.5 ? 0..rand(3..6) : 0..rand(1..3) do
      Marker.create(
          code: marker_arr.sample,
          severity: ["S0", "S1", "S2", "S3", "S4"].sample,
          position: [0, pss.tasktime].sample,
          pass_id: pss.id
        )
    end
  end