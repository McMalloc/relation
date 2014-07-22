class Participant < ActiveRecord::Base
  has_many :tasks, through: :passes
  has_many :passes
  has_one :persona
end
