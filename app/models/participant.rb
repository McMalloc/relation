class Participant < ActiveRecord::Base
  has_many :tasks, through: :passes
  has_many :passes
  has_one :persona
  has_and_belongs_to_many :projects
end
