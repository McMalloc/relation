class Participant < ActiveRecord::Base
  has_many :tasks, through: :passes
  has_many :passes
  belongs_to :persona
  has_and_belongs_to_many :projects
end
