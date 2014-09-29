class ParticipantsController < ApplicationController
  def fetch
    params[:participant_id] == "all" ? @participant_by_query = Participant.all : @participant_by_query = Participant.where("id = " + params[:participant_id])
    render json: @participant_by_query, root: false
    # find JSON definition in the serializer
    # prepare for multiple projects
  end
  
  def index
    @participants = Participant.all
    render json: @participants, root: false
  end
  
  def show
    @participant = Participant.find(params[:id])
  end
  
  def create
    @new_participant = Participant.create(participant_params)
    puts @new_participant.to_yaml
    render json: @new_participant, root: false
  end
  
  def update
    # @participant = Participant.find(params[:id])
    @participant = Participant.find(params[:id])
    @participant.update_attributes(participant_params)
    render json: @participant, root: false, status: :ok
  end  
  
  def destroy
    @participant = Participant.find(params[:id])
    @participant.destroy
    head :no_content # 204 status code for deleting
  end
  
  def participant_params
    params.require(:participant).permit!
  end
  
end
