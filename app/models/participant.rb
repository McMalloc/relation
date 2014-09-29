class Participant < ActiveRecord::Base
  has_many :tasks, through: :passes
  has_many :passes
  belongs_to :persona
  belongs_to :project
end
