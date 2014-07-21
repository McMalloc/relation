class Prototype < ActiveRecord::Base
  belongs_to :task
  belongs_to :participant
  belongs_to :project
end
