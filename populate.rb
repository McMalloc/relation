# make Codes a table
def generateSet()
  Task.create( name: "Change your default signature")
  Task.create( name: "Add an address to a mailing list" )
  Task.create( name: "Create an appointment in a shared calendar" )
  Task.create( name: "Export your address book" )
  Task.create( name: "Restore a deleted draft" )

  Persona.create( moniker: "Corporate power user" )
  Persona.create( moniker: "Freelance power user" )
  Persona.create( moniker: "Frequent use in administration")
  Persona.create( moniker: "Moderate private use" )

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
    base_tasktime = rand(40..100)
    difficulty = rand
    Participant.all.each do |p|
      Pass.create( 
          task_id: t.id,
          participant_id: p.id,
          sum: (1..100).to_a.sample/100.0, #/
          tasktime: base_tasktime + rand(10..30),
          satisfaction: rand(10..50)/10.0, #/
          completed: difficulty < 0.2 ? true : false
        )
    end
  end
end

class RandomGaussian
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