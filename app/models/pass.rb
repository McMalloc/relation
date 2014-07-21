class Pass < ActiveRecord::Base
  belongs_to :task
  belongs_to :participant
  has_one :recording
end
