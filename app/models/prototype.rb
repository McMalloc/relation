class Prototype < ActiveRecord::Base
  has_many :tasks, through: :project
  has_many :participants
  has_many :passes
  belongs_to :project
end
