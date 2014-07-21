class Prototype < ActiveRecord::Base
  has_many :tasks, through: :project
  belongs_to :participant
  belongs_to :project
end
